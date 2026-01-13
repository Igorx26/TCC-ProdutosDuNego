package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.BusinessRuleException;
import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.FornecedorModel;
import backend.ProdutosDuNego.repository.FornecedorRepository;
import backend.ProdutosDuNego.rest.dto.FornecedorDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    @Autowired
    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }


    @Transactional(readOnly = true)
    public List<FornecedorDTO> obterTodos() {
        return fornecedorRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FornecedorDTO obterPorId(Long id) {
        return fornecedorRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Fornecedor não encontrado! Id: " + id));
    }

    @Transactional
    public FornecedorDTO salvar(FornecedorDTO dto) {
        validarCnpj(dto.cnpj(), null); // Adiciona a validação do CNPJ

        FornecedorModel fornecedor = toEntity(dto);
        return toDTO(fornecedorRepository.save(fornecedor));
    }

    @Transactional
    public FornecedorDTO atualizar(Long id, FornecedorDTO dto) {
        FornecedorModel fornecedorExistente = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Fornecedor não encontrado! Id: " + id));

        validarCnpj(dto.cnpj(), fornecedorExistente.getCnpj()); // Adiciona a validação do CNPJ

        updateEntityFromDTO(fornecedorExistente, dto);
        return toDTO(fornecedorRepository.save(fornecedorExistente));
    }

    /**
     * Valida um CNPJ se ele for fornecido.
     * @param novoCnpj O novo CNPJ a ser validado.
     * @param cnpjAntigo O CNPJ existente (usado em atualizações para evitar auto-comparação). Pode ser nulo para novos cadastros.
     */
    private void validarCnpj(String novoCnpj, String cnpjAntigo) {
        // A validação só ocorre se um CNPJ for preenchido.
        if (StringUtils.hasText(novoCnpj)) {
            // 1. Valida o formato e os dígitos verificadores
            if (!isCnpjValido(novoCnpj)) {
                throw new BusinessRuleException("O formato do CNPJ informado é inválido.");
            }

            // 2. Valida a unicidade (se o CNPJ mudou ou é um novo cadastro)
            if (!novoCnpj.equals(cnpjAntigo)) {
                fornecedorRepository.findByCnpj(novoCnpj).ifPresent(f -> {
                    throw new BusinessRuleException("O CNPJ informado já está em uso por outro fornecedor.");
                });
            }
        }
    }

    /**
     * Verifica se uma string de CNPJ é válida.
     * @param cnpj String do CNPJ (pode conter ou não a formatação).
     * @return true se o CNPJ for válido, false caso contrário.
     */
    private boolean isCnpjValido(String cnpj) {
        cnpj = cnpj.replaceAll("[^\\d]", ""); // Remove caracteres não numéricos

        if (cnpj.length() != 14) return false;

        // Elimina CNPJs invalidos conhecidos
        if (cnpj.matches("(\\d)\\1{13}")) return false;

        try {
            // Cálculo do primeiro dígito verificador
            int soma = 0;
            int peso = 2;
            for (int i = 11; i >= 0; i--) {
                soma += (cnpj.charAt(i) - '0') * peso;
                peso++;
                if (peso == 10) peso = 2;
            }
            int dv1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
            if ((cnpj.charAt(12) - '0') != dv1) return false;

            // Cálculo do segundo dígito verificador
            soma = 0;
            peso = 2;
            for (int i = 12; i >= 0; i--) {
                soma += (cnpj.charAt(i) - '0') * peso;
                peso++;
                if (peso == 10) peso = 2;
            }
            int dv2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
            if ((cnpj.charAt(13) - '0') != dv2) return false;

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void deletar(Long id) {
        FornecedorModel fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Fornecedor não encontrado! Id: " + id));
        fornecedor.setAtivo(false);
        fornecedorRepository.save(fornecedor);
    }

    @Transactional
    public void reativar(Long id) {
        FornecedorModel fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Fornecedor não encontrado! Id: " + id));
        fornecedor.setAtivo(true);
        fornecedorRepository.save(fornecedor);
    }

    private FornecedorDTO toDTO(FornecedorModel model) {
        return new FornecedorDTO(model.getId(), model.getEmpresa(), model.getCnpj(), model.getTelefoneEmpresa(), model.getNomeVendedor(), model.getCelularVendedor(), model.getEmail(), model.isAtivo());
    }

    private FornecedorModel toEntity(FornecedorDTO dto) {
        FornecedorModel model = new FornecedorModel();
        model.setEmpresa(dto.empresa());
        model.setCnpj(dto.cnpj());
        model.setTelefoneEmpresa(dto.telefoneEmpresa());
        model.setNomeVendedor(dto.nomeVendedor());
        model.setCelularVendedor(dto.celularVendedor());
        model.setEmail(dto.email());
        model.setAtivo(true);
        return model;
    }

    private void updateEntityFromDTO(FornecedorModel entity, FornecedorDTO dto) {
        entity.setEmpresa(dto.empresa());
        entity.setCnpj(dto.cnpj());
        entity.setTelefoneEmpresa(dto.telefoneEmpresa());
        entity.setNomeVendedor(dto.nomeVendedor());
        entity.setCelularVendedor(dto.celularVendedor());
        entity.setEmail(dto.email());
        entity.setAtivo(dto.ativo());
    }
}