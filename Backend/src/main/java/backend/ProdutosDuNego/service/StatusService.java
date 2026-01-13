package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.StatusModel;
import backend.ProdutosDuNego.repository.StatusRepository;
import backend.ProdutosDuNego.rest.dto.StatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatusService {

    private final StatusRepository statusRepository;

    @Autowired
    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }


    @Transactional(readOnly = true)
    public List<StatusDTO> obterTodos() {
        return statusRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StatusDTO obterPorId(Long id) {
        return statusRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Status não encontrado! Id: " + id));
    }
    @Transactional
    public StatusDTO salvar(StatusDTO dto) {
        StatusModel status = toEntity(dto);
        status.setAtivo(true);
        return toDTO(statusRepository.save(status));
    }

    @Transactional
    public StatusDTO atualizar(Long id, StatusDTO dto) {
        StatusModel statusExistente = statusRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Status não encontrado! Id: " + id));

        statusExistente.setDescricao(dto.descricao());
        return toDTO(statusRepository.save(statusExistente));
    }

    @Transactional
    public void deletar(Long id) {
        StatusModel status = statusRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Status não encontrado! Id: " + id));
        status.setAtivo(false);
        statusRepository.save(status);
    }

    @Transactional
    public void reativar(Long id) {
        StatusModel status = statusRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Status não encontrado! Id: " + id));
        status.setAtivo(true);
        statusRepository.save(status);
    }

    private StatusDTO toDTO(StatusModel model) {
        return new StatusDTO(model.getId(), model.getDescricao(), model.isAtivo());
    }

    private StatusModel toEntity(StatusDTO dto) {
        StatusModel model = new StatusModel();
        model.setId(dto.id());
        model.setDescricao(dto.descricao());
        return model;
    }
}