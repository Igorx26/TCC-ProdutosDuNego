package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.FormaPagamentoModel;
import backend.ProdutosDuNego.repository.FormaPagamentoRepository;
import backend.ProdutosDuNego.rest.dto.FormaPagamentoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormaPagamentoService {

    private final FormaPagamentoRepository formaPagamentoRepository;

    @Autowired
    public FormaPagamentoService(FormaPagamentoRepository formaPagamentoRepository) {
        this.formaPagamentoRepository = formaPagamentoRepository;
    }

    @Transactional(readOnly = true)
    public FormaPagamentoDTO obterPorId(Long id) {
        FormaPagamentoModel formaPagamento = formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + FormaPagamentoModel.class.getSimpleName()));
        return toDTO(formaPagamento);
    }

    @Transactional(readOnly = true)
    public List<FormaPagamentoDTO> obterTodos() {
        return formaPagamentoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FormaPagamentoDTO salvar(FormaPagamentoDTO dto) {
        FormaPagamentoModel formaPagamento = toEntity(dto);
        formaPagamento.setAtivo(true);
        return toDTO(formaPagamentoRepository.save(formaPagamento));
    }

    @Transactional
    public FormaPagamentoDTO atualizar(Long id, FormaPagamentoDTO dto) {
        FormaPagamentoModel formaExistente = formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + FormaPagamentoModel.class.getSimpleName()));

        formaExistente.setDescricao(dto.descricao());
        formaExistente.setAtivo(dto.ativo());
        return toDTO(formaPagamentoRepository.save(formaExistente));
    }

    @Transactional
    public void deletar(Long id) {
        FormaPagamentoModel formaPagamento = formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + FormaPagamentoModel.class.getSimpleName()));

        formaPagamento.setAtivo(false); // Soft Delete
        formaPagamentoRepository.save(formaPagamento);
    }

    /**
     * Reativa uma forma de pagamento deletada logicamente (soft delete).
     * @param id O ID da forma de pagamento a ser reativada.
     */
    @Transactional
    public void reativar(Long id) {
        FormaPagamentoModel formaPagamento = formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + FormaPagamentoModel.class.getSimpleName()));

        formaPagamento.setAtivo(true);
        formaPagamentoRepository.save(formaPagamento);
    }

    private FormaPagamentoDTO toDTO(FormaPagamentoModel model) {
        return new FormaPagamentoDTO(model.getId(), model.getDescricao(), model.isAtivo());
    }

    private FormaPagamentoModel toEntity(FormaPagamentoDTO dto) {
        return new FormaPagamentoModel(null, dto.descricao(), true);
    }
}