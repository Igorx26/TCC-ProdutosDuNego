package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.UsuarioEnderecoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioEnderecoRepository extends JpaRepository<UsuarioEnderecoModel, Long> {

    // CORRETO: O nome do método agora corresponde ao campo "idUsuario" na entidade.
    List<UsuarioEnderecoModel> findByIdUsuario(Long usuarioId);

    // CORRETO: O nome do método corresponde aos campos "idUsuario" e "isAtivo".
    List<UsuarioEnderecoModel> findByIdUsuarioAndIsAtivoTrue(Long usuarioId);

    // CORRETO: O nome do método corresponde aos campos "idUsuario" e "isPrincipal".
    Optional<UsuarioEnderecoModel> findByIdUsuarioAndIsPrincipalTrue(Long usuarioId);

    // Busca uma ligação específica por ID de usuário e ID de endereço
    Optional<UsuarioEnderecoModel> findByIdUsuarioAndIdEndereco(Long usuarioId, Long enderecoId);
}