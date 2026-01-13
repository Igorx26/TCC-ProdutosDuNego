package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.VendaItemModel;
import backend.ProdutosDuNego.model.VendaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendaItemRepository extends JpaRepository<VendaItemModel, Long> {

    List<VendaItemModel> findByVenda(VendaModel venda);
}