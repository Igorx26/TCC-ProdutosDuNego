package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.MedidaModel;
import backend.ProdutosDuNego.repository.MedidaRepository;
import backend.ProdutosDuNego.rest.dto.MedidaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedidaService {

    private final MedidaRepository medidaRepository;

    @Autowired
    public MedidaService(MedidaRepository medidaRepository) {
        this.medidaRepository = medidaRepository;
    }

    // de: findById
    @Transactional(readOnly = true)
    public MedidaDTO obterPorId(Long id) {
        MedidaModel medida = medidaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + MedidaModel.class.getSimpleName()));
        return toDTO(medida);
    }

    // de: findAll
    @Transactional(readOnly = true)
    public List<MedidaDTO> obterTodos() {
        return medidaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // de: create
    @Transactional
    public MedidaDTO salvar(MedidaDTO dto) {
        MedidaModel medida = toEntity(dto);
        return toDTO(medidaRepository.save(medida));
    }

    // de: update
    @Transactional
    public MedidaDTO atualizar(Long id, MedidaDTO dto) {
        MedidaModel medidaExistente = medidaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + MedidaModel.class.getSimpleName()));

        medidaExistente.setNome(dto.nome());
        medidaExistente.setAtivo(dto.ativo());
        return toDTO(medidaRepository.save(medidaExistente));
    }

    // de: delete
    @Transactional
    public void deletar(Long id) {
        MedidaModel medida = medidaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + MedidaModel.class.getSimpleName()));

        medida.setAtivo(false); // Soft Delete
        medidaRepository.save(medida);
    }
    /**
     * Reativa uma medida deletada logicamente (soft delete).
     * @param id O ID da medida a ser reativada.
     */
    @Transactional
    public void reativar(Long id) {
        MedidaModel medida = medidaRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Objeto não encontrado! Id: " + id + ", Tipo: " + MedidaModel.class.getSimpleName()));

        medida.setAtivo(true); // Altera o status para ativo
        medidaRepository.save(medida); // Salva a alteração no banco
    }

    private MedidaDTO toDTO(MedidaModel model) {
        return new MedidaDTO(model.getId(), model.getNome(), model.isAtivo());
    }

    private MedidaModel toEntity(MedidaDTO dto) {
        return new MedidaModel(null, dto.nome(), true);
    }
}