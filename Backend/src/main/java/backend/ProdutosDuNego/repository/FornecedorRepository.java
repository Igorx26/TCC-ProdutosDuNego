package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.FornecedorModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FornecedorRepository extends JpaRepository<FornecedorModel, Long> {
    Optional<FornecedorModel> findByCnpj(String cnpj);
}