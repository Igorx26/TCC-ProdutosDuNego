package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.FormaPagamentoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormaPagamentoRepository extends JpaRepository<FormaPagamentoModel, Long> {

}
