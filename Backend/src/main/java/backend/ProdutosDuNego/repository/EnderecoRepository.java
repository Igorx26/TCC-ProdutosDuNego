package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.EnderecoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnderecoRepository extends JpaRepository<EnderecoModel, Long> {

    @Query("SELECT e FROM EnderecoModel e WHERE e.cep = :cep AND e.numero = :numero AND " +
            "(:complemento IS NULL OR e.complemento = :complemento)")
    Optional<EnderecoModel> findByCepAndNumeroAndComplemento(
            @Param("cep") String cep,
            @Param("numero") String numero,
            @Param("complemento") String complemento);

}
