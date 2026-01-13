package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.ProdutoModel;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;


@Repository
public interface ProdutoRepository extends JpaRepository<ProdutoModel, Long> {


    Optional<ProdutoModel> findById(Long id);
}
