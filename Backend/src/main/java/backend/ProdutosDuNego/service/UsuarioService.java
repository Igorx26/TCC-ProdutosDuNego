package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.BusinessRuleException;
import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.EnderecoModel;
import backend.ProdutosDuNego.model.UsuarioEnderecoModel;
import backend.ProdutosDuNego.model.UsuarioModel;
import backend.ProdutosDuNego.model.enums.UnidadeFederativa;
import backend.ProdutosDuNego.repository.EnderecoRepository;
import backend.ProdutosDuNego.repository.UsuarioEnderecoRepository;
import backend.ProdutosDuNego.repository.UsuarioRepository;
import backend.ProdutosDuNego.rest.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityService securityService;
    private final EnderecoRepository enderecoRepository;
    private final UsuarioEnderecoRepository usuarioEnderecoRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, SecurityService securityService,EnderecoRepository enderecoRepository,
                          UsuarioEnderecoRepository usuarioEnderecoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityService = securityService;
        this.enderecoRepository = enderecoRepository;
        this.usuarioEnderecoRepository = usuarioEnderecoRepository;
    }

    /**
     * Cria um novo usuário ou reativa uma conta inativa com os mesmos dados.
     * @param dto Os dados do usuário a ser criado/reativado.
     * @return Os dados do usuário criado ou reativado, sem a senha.
     * @throws BusinessRuleException se os dados únicos já pertencerem a um usuário ATIVO.
     */
    @Transactional
    public UsuarioResponseDTO salvar(UsuarioCreateDTO dto) {
        // --- 1. Busca por um usuário existente (ativo ou inativo) ---
        Optional<UsuarioModel> usuarioExistenteOpt = usuarioRepository
                .findByNomeUsuarioOrCpf(dto.getNomeUsuario(), dto.getCpf());

        if (usuarioExistenteOpt.isPresent()) {
            UsuarioModel usuarioExistente = usuarioExistenteOpt.get();

            // --- 2a. Se o usuário encontrado já estiver ATIVO, lança erro ---
            if (usuarioExistente.isAtivo()) {
                throw new BusinessRuleException("Já existe um usuário ativo com os dados informados (nomeUsuario, e-mail ou CPF).");
            }

            // --- 2b. Se o usuário encontrado estiver INATIVO, reativa a conta ---
            else {
                // Atualiza os dados do usuário com as novas informações
                updateEntityFromCreateDTO(usuarioExistente, dto);

                // Criptografa e atualiza a nova senha
                String senhaCriptografada = passwordEncoder.encode(dto.getSenha());
                usuarioExistente.setSenha(senhaCriptografada);

                // Reativa o usuário
                usuarioExistente.setAtivo(true);

                // Salva o usuário atualizado
                UsuarioModel usuarioReativado = usuarioRepository.save(usuarioExistente);
                return toResponseDTO(usuarioReativado);
            }
        }

        // --- 3. Se nenhum usuário foi encontrado, cria um novo ---
        UsuarioModel novoUsuario = toEntity(dto);
        String senhaCriptografada = passwordEncoder.encode(dto.getSenha());
        novoUsuario.setSenha(senhaCriptografada);

        UsuarioModel usuarioSalvo = usuarioRepository.save(novoUsuario);
        return toResponseDTO(usuarioSalvo);
    }

    @Transactional
    public UsuarioResponseDTO salvarUsuarioComEndereco(UsuarioComEnderecoDTO dto) {
        if (usuarioRepository.findByNomeUsuario(dto.usuario().getNomeUsuario()).isPresent()) {
            throw new BusinessRuleException("Nome de usuário já cadastrado.");
        }

        EnderecoDTO enderecoDto = dto.endereco();
        EnderecoModel endereco = enderecoRepository
                .findByCepAndNumeroAndComplemento(
                        enderecoDto.cep(),
                        enderecoDto.numero(),
                        enderecoDto.complemento()
                )
                .orElseGet(() -> {
                    EnderecoModel novoEndereco = toEnderecoEntity(enderecoDto);
                    return enderecoRepository.save(novoEndereco);
                });

        UsuarioModel novoUsuario = toUsuarioEntity(dto.usuario());
        novoUsuario.setSenha(passwordEncoder.encode(dto.usuario().getSenha()));
        novoUsuario = usuarioRepository.save(novoUsuario);

        UsuarioEnderecoModel ligacao = new UsuarioEnderecoModel();
        ligacao.setIdUsuario(novoUsuario.getId());
        ligacao.setIdEndereco(endereco.getId());
        ligacao.setPrincipal(true);
        ligacao.setAtivo(true);
        usuarioEnderecoRepository.save(ligacao);

        return toUsuarioResponseDTO(novoUsuario);
    }

    /**
     * Retorna uma lista com todos os usuários do sistema.
     * @return Lista de usuários.
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> obterTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca um usuário pelo seu ID.
     * @param id O ID do usuário.
     * @return Os dados do usuário encontrado.
     * @throws ObjectNotFoundException se o usuário não for encontrado.
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obterPorId(Long id) {
        securityService.checkOwnershipOrAdmin(id);
        UsuarioModel usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado! Id: " + id));
        return toResponseDTO(usuario);
    }

    /**
     * Atualiza os dados de um usuário existente.
     * @param id O ID do usuário a ser atualizado.
     * @param dto Os novos dados para o usuário.
     * @return Os dados do usuário atualizado.
     */
    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        // verifica se o usuário autenticado é dono do recurso
        securityService.checkOwnershipOrAdmin(id);
        UsuarioModel usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado! Id: " + id));

        // Regra de Negócio: Se o email foi alterado, verifica se o novo email já não está em uso por outro usuário
        if (dto.email() != null && !dto.email().equals(usuarioExistente.getEmail())) {
            usuarioRepository.findByEmail(dto.email()).ifPresent(user -> {
                throw new BusinessRuleException("O e-mail informado já está em uso por outro usuário.");
            });
        }

        // Atualiza os dados da entidade com base no DTO
        updateEntityFromDTO(usuarioExistente, dto);

        UsuarioModel usuarioAtualizado = usuarioRepository.save(usuarioExistente);
        return toResponseDTO(usuarioAtualizado);
    }

    @Transactional
    public UsuarioResponseDTO atualizarPerfil(UsuarioUpdateDTO dto) {
        // Pega o usuário autenticado a partir do token
        UsuarioModel usuarioLogado = securityService.getAuthenticatedUser();

        // Atualiza os campos permitidos
        usuarioLogado.setNome(dto.nome());
        usuarioLogado.setSobrenome(dto.sobrenome());
        usuarioLogado.setCelular(dto.celular());
        usuarioLogado.setEmail(dto.email());

        UsuarioModel usuarioSalvo = usuarioRepository.save(usuarioLogado);

        return toUsuarioResponseDTO(usuarioSalvo); // Reutiliza seu método de conversão
    }

    /**
     * Realiza um soft delete de um usuário, marcando-o como inativo.
     * @param id O ID do usuário a ser deletado.
     */
    @Transactional
    public void deletar(Long id) {
        // verifica se o usuário autenticado é dono do recurso
        securityService.checkOwnershipOrAdmin(id);
        UsuarioModel usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado! Id: " + id));

        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
    /**
     * Reativa um usuário deletado logicamente (soft delete).
     * @param id O ID do usuário a ser reativado.
     */
    @Transactional
    public void reativar(Long id) {
        UsuarioModel usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado! Id: " + id));

        usuario.setAtivo(true);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void alterarSenha(UsuarioUpdatePasswordDTO dto) {
        UsuarioModel usuarioLogado = securityService.getAuthenticatedUser();

        // 1. Verifica se a senha atual fornecida corresponde à senha no banco
        if (!passwordEncoder.matches(dto.getSenhaAtual(), usuarioLogado.getSenha())) {
            throw new BusinessRuleException("A senha atual está incorreta.");
        }

        // 2. Verifica se a nova senha e a confirmação são iguais
        if (!dto.getNovaSenha().equals(dto.getConfirmacaoNovaSenha())) {
            throw new BusinessRuleException("A nova senha e a confirmação não correspondem.");
        }

        // 3. Criptografa e salva a nova senha
        usuarioLogado.setSenha(passwordEncoder.encode(dto.getNovaSenha()));
        usuarioRepository.save(usuarioLogado);
    }


    // --- MÉTODOS PRIVADOS DE AJUDA ---

    private void validarDuplicidade(String username, String email, String cpf) {
        if (usuarioRepository.findByNomeUsuario(username).isPresent()) {
            throw new BusinessRuleException("Já existe um usuário cadastrado com este username.");
        }
        if (email != null && usuarioRepository.findByEmail(email).isPresent()) {
            throw new BusinessRuleException("Já existe um usuário cadastrado com este e-mail.");
        }
        if (cpf != null && usuarioRepository.findByCpf(cpf).isPresent()) {
            throw new BusinessRuleException("Já existe um usuário cadastrado com este CPF.");
        }
    }
    // --- Crie este novo método de ajuda para atualizar a entidade ---
    private void updateEntityFromCreateDTO(UsuarioModel entity, UsuarioCreateDTO dto) {
        entity.setNomeUsuario(dto.getNomeUsuario());
        entity.setNome(dto.getNome());
        entity.setSobrenome(dto.getSobrenome());
        entity.setEmail(dto.getEmail());
        entity.setCpf(dto.getCpf());
        entity.setCelular(dto.getCelular());
        entity.setDataNascimento(dto.getDataNascimento());
    }

    private void updateEntityFromDTO(UsuarioModel entity, UsuarioUpdateDTO dto) {
        entity.setNome(dto.nome());
        entity.setSobrenome(dto.sobrenome());
        entity.setCelular(dto.celular());
        entity.setEmail(dto.email());
    }

    private UsuarioModel toEntity(UsuarioCreateDTO dto) {
        UsuarioModel model = new UsuarioModel();
        model.setNomeUsuario(dto.getNomeUsuario());
        model.setNome(dto.getNome());
        model.setSobrenome(dto.getSobrenome());
        model.setEmail(dto.getEmail());
        model.setCpf(dto.getCpf());
        model.setCelular(dto.getCelular());
        model.setDataNascimento(dto.getDataNascimento());
        model.setAtivo(true);
        model.setAdmin(false);
        return model;
    }

    private UsuarioResponseDTO toResponseDTO(UsuarioModel model) {
        return new UsuarioResponseDTO(
                model.getId(),
                model.getNomeUsuario(),
                model.getNome(),
                model.getSobrenome(),
                model.getDataNascimento(),
                model.getCelular(),
                model.getEmail(),
                model.getDataCadastro(),
                model.getUltimoLogin(),
                model.isAdmin()
        );
    }

    private UsuarioModel toUsuarioEntity(UsuarioCreateDTO dto) {
        UsuarioModel model = new UsuarioModel();
        model.setNomeUsuario(dto.getNomeUsuario());
        // A senha será criptografada no método principal
        model.setNome(dto.getNome());
        model.setSobrenome(dto.getSobrenome());
        model.setCpf(dto.getCpf());
        model.setCelular(dto.getCelular());
        model.setEmail(dto.getEmail());
        model.setDataNascimento(dto.getDataNascimento());
        // Valores padrão
        model.setAtivo(true);
        model.setAdmin(false);
        return model;
    }

    private EnderecoModel toEnderecoEntity(EnderecoDTO dto) {
        EnderecoModel model = new EnderecoModel();
        model.setCep(dto.cep());
        model.setLogradouro(dto.logradouro());
        model.setNumero(dto.numero());
        model.setComplemento(dto.complemento());
        model.setBairro(dto.bairro());
        model.setCidade(dto.cidade());
        model.setUf(UnidadeFederativa.valueOf(dto.uf().toUpperCase())); // Supondo que você tenha o Enum UnidadeFederativa
        return model;
    }

    private UsuarioResponseDTO toUsuarioResponseDTO(UsuarioModel model) {
        return new UsuarioResponseDTO(
                model.getId(),
                model.getNomeUsuario(),
                model.getNome(),
                model.getSobrenome(),
                model.getDataNascimento(),
                model.getCelular(),
                model.getEmail(),
                model.getDataCadastro(),
                model.getUltimoLogin(),
                model.isAdmin()
        );
    }
}