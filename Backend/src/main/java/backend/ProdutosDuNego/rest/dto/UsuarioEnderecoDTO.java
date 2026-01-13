package backend.ProdutosDuNego.rest.dto;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class UsuarioEnderecoDTO {

    private Long id;
    private Boolean enderecoPrincipal;
    private Long idUsuario;
    private Long idEndereco;
    private boolean ativo;
}
