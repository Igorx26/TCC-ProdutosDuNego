package backend.ProdutosDuNego.exception;



import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.format.DateTimeParseException;

///**
// * Classe que trata exceções globais para a aplicação.
// */

@ControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler(ObjectNotFoundException.class)
    public ResponseEntity<StandardError> objectNotFound(ObjectNotFoundException e, HttpServletRequest request) {
        StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.NOT_FOUND.value(), "Não encontrado", e.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @ExceptionHandler(DataIntegrityException.class)
    public ResponseEntity<StandardError> dataIntegrity(DataIntegrityException e, HttpServletRequest request) {
        StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.BAD_REQUEST.value(), "Integridade de dados", e.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(ConstraintException.class)
    public ResponseEntity<StandardError> constraint(ConstraintException e, HttpServletRequest request) {
        StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.BAD_REQUEST.value(), "Restrição de dados", e.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<StandardError> businessRule(BusinessRuleException e, HttpServletRequest request) {
        StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.CONFLICT.value(), "Regra de negócio", e.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
    }


    @ExceptionHandler(SQLException.class)
    public ResponseEntity<StandardError> sql(SQLException e, HttpServletRequest request){
        StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Erro de conexão com o banco de dados", e.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }

    @ExceptionHandler(FormatDataInvalidException.class)
    public ResponseEntity<StandardError> handleFormatDataInvalid(FormatDataInvalidException e, HttpServletRequest request) {
        StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.BAD_REQUEST.value(),"Erro de Formatação de Dados", e.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<StandardError> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        Throwable cause = ex.getCause();

        // Verifica se a causa raiz é um erro de formatação de data
        if (cause instanceof InvalidFormatException invalidFormatException) {
            if (invalidFormatException.getCause() instanceof DateTimeParseException) {
                // Retorna uma mensagem clara para o cliente sobre o erro de formatação de data
                StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.BAD_REQUEST.value(),"Erro de Formatação de Dados","Formato de data inválido. Use o padrão 'yyyy-MM-dd'.", request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }
        }

        // Mensagem genérica para outros casos
        StandardError err = new StandardError(System.currentTimeMillis(), HttpStatus.BAD_REQUEST.value(),"Erro de leitura JSON","Erro de leitura na requisição. Verifique o formato dos dados enviados.", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }
    /**
     * Captura erros de conversão de tipos nos parâmetros da URL (ex: data em formato inválido).
     * Este é o método que vai resolver o seu problema.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<StandardError> typeMismatch(MethodArgumentTypeMismatchException e, HttpServletRequest request) {
        // Obtém o nome do tipo esperado de forma mais limpa
        String tipoEsperado = e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "desconhecido";

        String mensagem = String.format("O parâmetro de URL '%s' recebeu o valor '%s', que é de um tipo inválido. Forneça um valor compatível com o tipo %s.",
                e.getName(), e.getValue(), tipoEsperado);

        StandardError err = new StandardError(
                System.currentTimeMillis(),
                HttpStatus.BAD_REQUEST.value(), // 400
                "Parâmetro Inválido",
                mensagem,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationError> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ValidationError err = new ValidationError();
        err.setTimestamp(System.currentTimeMillis());
        err.setStatus(HttpStatus.BAD_REQUEST.value());
        err.setError("Erro de validação");
        err.setMessage("Um ou mais campos estão inválidos.");
        err.setPath(request.getRequestURI());

        // Captura os erros específicos de campo
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            err.addError(error.getField(), error.getDefaultMessage());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }
    // Método de ajuda para obter o path da requisição
    private String getPath(WebRequest request) {
        try {
            return request.getDescription(false).substring(4); // Remove o "uri="
        } catch (Exception e) {
            return "";
        }
    }


}
