package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.MedidaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedidaRepository extends JpaRepository<MedidaModel, Long> {


}
