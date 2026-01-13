package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.CategoriaModel;
import backend.ProdutosDuNego.repository.CategoriaRepository;
import backend.ProdutosDuNego.rest.dto.CategoriaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Autowired
    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public CategoriaDTO obterPorId(Long id) {
        CategoriaModel categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + CategoriaModel.class.getSimpleName()));
        return toDTO(categoria);
    }

    @Transactional(readOnly = true)
    public List<CategoriaDTO> obterTodos() {
        return categoriaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaDTO salvar(CategoriaDTO dto) {
        CategoriaModel categoria = toEntity(dto);
        categoria.setAtivo(true);
        return toDTO(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaDTO atualizar(Long id, CategoriaDTO dto) {
        CategoriaModel categoriaExistente = categoriaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + CategoriaModel.class.getSimpleName()));

        categoriaExistente.setNome(dto.nome());
        categoriaExistente.setDescricao(dto.descricao());
        categoriaExistente.setAtivo(dto.ativo());

        return toDTO(categoriaRepository.save(categoriaExistente));
    }

    @Transactional
    public void deletar(Long id) {
        CategoriaModel categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + CategoriaModel.class.getSimpleName()));

        categoria.setAtivo(false); // Soft Delete
        categoriaRepository.save(categoria);
    }

    /**
     * Reativa uma categoria deletada logicamente (soft delete).
     * @param id O ID da categoria a ser reativada.
     */
    @Transactional
    public void reativar(Long id) {
        CategoriaModel categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + CategoriaModel.class.getSimpleName()));

        categoria.setAtivo(true);
        categoriaRepository.save(categoria);
    }

    private CategoriaDTO toDTO(CategoriaModel model) {
        return new CategoriaDTO(model.getId(), model.getNome(), model.getDescricao(), model.isAtivo());
    }

    private CategoriaModel toEntity(CategoriaDTO dto) {
        // ID é nulo na criação, nome e descrição vêm do DTO, ativo é sempre true na criação
        return new CategoriaModel(null, dto.nome(), dto.descricao(), true);
    }
}