package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.VendaModel;
import backend.ProdutosDuNego.rest.dto.RelatorioVendasDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<VendaModel, Long> {
    List<VendaModel> findByIdUsuarioEnderecoIn(List<Long> usuarioEnderecoIds);
    List<VendaModel> findByIdStatus(Long statusId);

    List<VendaModel> findByDataHoraBetween(LocalDateTime dataInicial, LocalDateTime dataFinal);
    List<VendaModel> findByDataHoraBetweenAndIdStatus(LocalDateTime dataInicial, LocalDateTime dataFinal, Long statusId);

}