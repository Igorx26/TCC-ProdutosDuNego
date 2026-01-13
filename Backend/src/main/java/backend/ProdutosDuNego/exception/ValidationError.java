package backend.ProdutosDuNego.exception;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * Classe para representar erros de validação detalhados, estendendo as propriedades de StandardError.
 */
@Getter
public class ValidationError extends StandardError {
    private static final long serialVersionUID = 1L;

    private final List<FieldMessage> errors = new ArrayList<>();

    /**
     * Adiciona um erro específico de campo à lista de erros.
     *
     * @param fieldName Nome do campo com erro.
     * @param message   Mensagem de erro associada ao campo.
     */
    public void addError(String fieldName, String message) {
        errors.add(new FieldMessage(fieldName, message));
    }
}