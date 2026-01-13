package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.BusinessRuleException;
import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.EnderecoModel;
import backend.ProdutosDuNego.model.UsuarioEnderecoModel;
import backend.ProdutosDuNego.model.enums.UnidadeFederativa;
import backend.ProdutosDuNego.repository.EnderecoRepository;
import backend.ProdutosDuNego.repository.UsuarioEnderecoRepository;
import backend.ProdutosDuNego.repository.UsuarioRepository;
import backend.ProdutosDuNego.rest.dto.EnderecoDTO;
import backend.ProdutosDuNego.rest.dto.EnderecoResponseDTO;
import backend.ProdutosDuNego.rest.dto.UsuarioEnderecoCreateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnderecoService {

    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final UsuarioEnderecoRepository usuarioEnderecoRepository;
    private final SecurityService securityService;

    @Autowired
    public EnderecoService(UsuarioRepository usuarioRepository, EnderecoRepository enderecoRepository, UsuarioEnderecoRepository usuarioEnderecoRepository, SecurityService securityService) {
        this.usuarioRepository = usuarioRepository;
        this.enderecoRepository = enderecoRepository;
        this.usuarioEnderecoRepository = usuarioEnderecoRepository;
        this.securityService = securityService;
    }

    @Transactional
    public EnderecoResponseDTO adicionarEndereco(Long usuarioId, UsuarioEnderecoCreateDTO dto) {
        securityService.checkOwnershipOrAdmin(usuarioId);

        EnderecoDTO enderecoDto = dto.endereco();
        Optional<EnderecoModel> enderecoExistenteOpt = enderecoRepository.findByCepAndNumeroAndComplemento(
                enderecoDto.cep(),
                enderecoDto.numero(),
                enderecoDto.complemento()
        );
        EnderecoModel enderecoParaVincular = enderecoExistenteOpt.orElseGet(() -> {
            EnderecoModel novoEndereco = toEntity(enderecoDto);
            return enderecoRepository.save(novoEndereco);
        });
        Optional<UsuarioEnderecoModel> vinculoExistenteOpt = usuarioEnderecoRepository
                .findByIdUsuarioAndIdEndereco(usuarioId, enderecoParaVincular.getId());

        if (vinculoExistenteOpt.isPresent()) {
            UsuarioEnderecoModel vinculoExistente = vinculoExistenteOpt.get();
            if (vinculoExistente.isAtivo()) {
                // 3a. Se o vínculo já existe e está ATIVO, lança um erro.
                throw new BusinessRuleException("Este endereço já está cadastrado na sua conta.");
            } else {
                // 3b. Se o vínculo existe mas está INATIVO, nós o REATIVAMOS.
                vinculoExistente.setAtivo(true);
                // (Opcional) Podemos também redefinir como principal se o DTO solicitar
                boolean deveSerPrincipal = dto.isPrincipal() != null && dto.isPrincipal();
                if (deveSerPrincipal) {
                    desmarcarAntigoPrincipal(usuarioId);
                    vinculoExistente.setPrincipal(true);
                }

                usuarioEnderecoRepository.save(vinculoExistente);
                return toResponseDTO(vinculoExistente, enderecoParaVincular);
            }
        }

        UsuarioEnderecoModel novaLigacao = new UsuarioEnderecoModel();
        novaLigacao.setIdUsuario(usuarioId);
        novaLigacao.setIdEndereco(enderecoParaVincular.getId());
        novaLigacao.setAtivo(true);

        boolean deveSerPrincipal = dto.isPrincipal() != null && dto.isPrincipal();
        if (deveSerPrincipal) {
            desmarcarAntigoPrincipal(usuarioId);
        }
        boolean isPrimeiroEndereco = usuarioEnderecoRepository.findByIdUsuarioAndIsAtivoTrue(usuarioId).isEmpty();
        novaLigacao.setPrincipal(deveSerPrincipal || isPrimeiroEndereco);

        usuarioEnderecoRepository.save(novaLigacao);

        return toResponseDTO(novaLigacao, enderecoParaVincular);
    }

    @Transactional(readOnly = true)
    public List<EnderecoResponseDTO> listarEnderecosPorUsuario(Long usuarioId ) {
        securityService.checkOwnershipOrAdmin(usuarioId);

        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado! Id: " + usuarioId));

        List<UsuarioEnderecoModel> ligacoes = usuarioEnderecoRepository.findByIdUsuarioAndIsAtivoTrue(usuarioId);
        if (ligacoes.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> idsDosEnderecos = ligacoes.stream().map(UsuarioEnderecoModel::getIdEndereco).collect(Collectors.toList());
        Map<Long, EnderecoModel> mapaDeEnderecos = enderecoRepository.findAllById(idsDosEnderecos).stream()
                .collect(Collectors.toMap(EnderecoModel::getId, endereco -> endereco));

        return ligacoes.stream().map(ligacao -> {
            EnderecoModel endereco = mapaDeEnderecos.get(ligacao.getIdEndereco());
            return toResponseDTO(ligacao, endereco);
        }).collect(Collectors.toList());
    }

    @Transactional
    public EnderecoResponseDTO atualizarEndereco(Long enderecoId, EnderecoDTO dto) {
        EnderecoModel enderecoExistente = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new ObjectNotFoundException("Endereço não encontrado! Id: " + enderecoId));

        updateEntityFromDTO(enderecoExistente, dto);
        EnderecoModel enderecoAtualizado = enderecoRepository.save(enderecoExistente);

        return toResponseDTO(null, enderecoAtualizado);
    }

    @Transactional
    public EnderecoResponseDTO atualizarEnderecoDoUsuario(Long usuarioId, Long usuarioEnderecoId, EnderecoDTO dto) {
        // 1. Garante que o usuário é o dono da ligação
        UsuarioEnderecoModel ligacao = findLigacaoAndVerifyOwnership(usuarioId, usuarioEnderecoId);

        // 2. Pega o endereço físico real
        EnderecoModel enderecoFisico = enderecoRepository.findById(ligacao.getIdEndereco())
                .orElseThrow(() -> new ObjectNotFoundException("Endereço físico não encontrado!"));

        // 3. Atualiza os dados do endereço físico
        updateEntityFromDTO(enderecoFisico, dto);
        enderecoRepository.save(enderecoFisico);

        // 4. Retorna o DTO de resposta
        return toResponseDTO(ligacao, enderecoFisico);
    }

    @Transactional
    public void deletarEndereco(Long usuarioId, Long usuarioEnderecoId) {
        securityService.checkOwnershipOrAdmin(usuarioId);
        UsuarioEnderecoModel ligacao = findLigacaoAndVerifyOwnership(usuarioId, usuarioEnderecoId);

        ligacao.setAtivo(false);
        usuarioEnderecoRepository.save(ligacao);

        if (ligacao.isPrincipal()) {
            usuarioEnderecoRepository.findByIdUsuarioAndIsAtivoTrue(usuarioId).stream()
                    .findFirst()
                    .ifPresent(this::marcarComoPrincipal);
        }
    }

    @Transactional
    public void reativarEndereco(Long usuarioId, Long usuarioEnderecoId) {
        securityService.checkOwnershipOrAdmin(usuarioId);
        UsuarioEnderecoModel ligacao = findLigacaoAndVerifyOwnership(usuarioId, usuarioEnderecoId);
        ligacao.setAtivo(true);
        usuarioEnderecoRepository.save(ligacao);
    }

    @Transactional
    public void definirComoPrincipal(Long usuarioId, Long usuarioEnderecoId) {
        securityService.checkOwnershipOrAdmin(usuarioId);
        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado! Id: " + usuarioId));
        
        UsuarioEnderecoModel novaLigacaoPrincipal = findLigacaoAndVerifyOwnership(usuarioId, usuarioEnderecoId);

        desmarcarAntigoPrincipal(usuarioId);
        marcarComoPrincipal(novaLigacaoPrincipal);
    }

    private void desmarcarAntigoPrincipal(Long usuarioId) {

        usuarioEnderecoRepository.findByIdUsuarioAndIsPrincipalTrue(usuarioId).ifPresent(antigaLigacaoPrincipal -> {
            antigaLigacaoPrincipal.setPrincipal(false);
            usuarioEnderecoRepository.save(antigaLigacaoPrincipal);
        });
    }

    private void marcarComoPrincipal(UsuarioEnderecoModel ligacao) {
        if (!ligacao.isAtivo()) {
            throw new BusinessRuleException("Não é possível definir um endereço inativo como principal.");
        }
        ligacao.setPrincipal(true);
        usuarioEnderecoRepository.save(ligacao);
    }

    private UsuarioEnderecoModel findLigacaoAndVerifyOwnership(Long usuarioId, Long usuarioEnderecoId ) {
        UsuarioEnderecoModel ligacao = usuarioEnderecoRepository.findById(usuarioEnderecoId)
                .orElseThrow(() -> new ObjectNotFoundException("Endereço não encontrado para este usuário! Id: " + usuarioEnderecoId));

        if (!ligacao.getIdUsuario().equals(usuarioId)) {
            throw new BusinessRuleException("Acesso negado. O endereço não pertence ao usuário informado.");
        }
        return ligacao;
    }

    private void updateEntityFromDTO(EnderecoModel entity, EnderecoDTO dto) {
        entity.setLogradouro(dto.logradouro());
        entity.setNumero(dto.numero());
        entity.setComplemento(dto.complemento());
        entity.setBairro(dto.bairro());
        entity.setCidade(dto.cidade());
        entity.setUf(UnidadeFederativa.valueOf(dto.uf().toUpperCase()));
        entity.setCep(dto.cep());
    }

    private EnderecoModel toEntity(EnderecoDTO dto) {
        EnderecoModel model = new EnderecoModel();
        updateEntityFromDTO(model, dto);
        return model;
    }

    private EnderecoResponseDTO toResponseDTO(UsuarioEnderecoModel ligacao, EnderecoModel endereco) {
        if (endereco == null) return null;
        return new EnderecoResponseDTO(
                ligacao != null ? ligacao.getId() : endereco.getId(),
                endereco.getLogradouro(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getUf().name(),
                endereco.getCep(),
                ligacao != null && ligacao.isPrincipal()
        );
    }
}