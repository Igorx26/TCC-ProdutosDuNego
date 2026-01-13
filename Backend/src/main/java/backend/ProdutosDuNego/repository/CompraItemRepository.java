package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.CompraItemModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CompraItemRepository extends JpaRepository<CompraItemModel, Long> {
    List<CompraItemModel> findByDataBetween(LocalDate dataInicial, LocalDate dataFinal);
}