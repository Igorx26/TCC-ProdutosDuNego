package backend.ProdutosDuNego.exception;

public class FormatDataInvalidException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public FormatDataInvalidException(String message) {
        super(message);
    }

    public FormatDataInvalidException(String message, Throwable cause) {
        super(message, cause);
    }
}