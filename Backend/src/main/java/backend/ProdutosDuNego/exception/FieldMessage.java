package backend.ProdutosDuNego.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;


import java.io.Serializable;

///**
// * Classe para representar mensagens de erro de validação para campos específicos.
// */
@Data
@NoArgsConstructor // Construtor sem argumentos
@AllArgsConstructor // Construtor com argumentos para todos os campos
public class FieldMessage implements Serializable {
    private static final long serialVersionUID = 1L;
    private String fieldName;
    private String message;
}