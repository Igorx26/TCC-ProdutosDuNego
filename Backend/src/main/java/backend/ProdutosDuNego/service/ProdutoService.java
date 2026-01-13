package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.CategoriaModel;
import backend.ProdutosDuNego.model.MedidaModel;
import backend.ProdutosDuNego.model.ProdutoModel;
import backend.ProdutosDuNego.repository.CategoriaRepository;
import backend.ProdutosDuNego.repository.MedidaRepository;
import backend.ProdutosDuNego.repository.ProdutoRepository;
import backend.ProdutosDuNego.rest.dto.ItemEstoqueDTO;
import backend.ProdutosDuNego.rest.dto.ProdutoDTO;
import backend.ProdutosDuNego.rest.dto.ProdutoResponseDTO;
import backend.ProdutosDuNego.rest.dto.RelatorioEstoqueDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Base64;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MedidaRepository medidaRepository;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository, MedidaRepository medidaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.medidaRepository = medidaRepository;
    }

    @Transactional(readOnly = true)
    public ProdutoResponseDTO obterPorId(Long id) {
        ProdutoModel produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado! Id: " + id));

        CategoriaModel categoria = categoriaRepository.findById(produto.getIdCategoria())
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada para o produto! Id Categoria: " + produto.getIdCategoria()));

        MedidaModel medida = medidaRepository.findById(produto.getIdMedida())
                .orElseThrow(() -> new ObjectNotFoundException("Medida não encontrada para o produto! Id Medida: " + produto.getIdMedida()));

        return toResponseDTO(produto, categoria, medida);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> obterTodos() {
        List<ProdutoModel> produtos = produtoRepository.findAll();

        List<Long> idsCategorias = produtos.stream().map(ProdutoModel::getIdCategoria).distinct().collect(Collectors.toList());
        List<Long> idsMedidas = produtos.stream().map(ProdutoModel::getIdMedida).distinct().collect(Collectors.toList());

        Map<Long, CategoriaModel> mapaCategorias = categoriaRepository.findAllById(idsCategorias).stream()
                .collect(Collectors.toMap(CategoriaModel::getId, categoria -> categoria));

        Map<Long, MedidaModel> mapaMedidas = medidaRepository.findAllById(idsMedidas).stream()
                .collect(Collectors.toMap(MedidaModel::getId, medida -> medida));

        return produtos.stream()
                .map(produto -> {
                    CategoriaModel categoria = mapaCategorias.getOrDefault(produto.getIdCategoria(), null);
                    MedidaModel medida = mapaMedidas.getOrDefault(produto.getIdMedida(), null);

                    if (categoria == null || medida == null) {
                        return null;
                    }

                    return toResponseDTO(produto, categoria, medida);
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProdutoResponseDTO salvar(ProdutoDTO dto) {
        CategoriaModel categoria = categoriaRepository.findById(dto.idCategoria())
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada! Id: " + dto.idCategoria()));

        MedidaModel medida = medidaRepository.findById(dto.idMedida())
                .orElseThrow(() -> new ObjectNotFoundException("Medida não encontrada! Id: " + dto.idMedida()));

        ProdutoModel novoProduto = toEntity(dto);
        novoProduto = produtoRepository.save(novoProduto);

        return toResponseDTO(novoProduto, categoria, medida);
    }

    @Transactional
    public ProdutoResponseDTO atualizar(Long id, ProdutoDTO dto) {
        ProdutoModel produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado! Id: " + id));

        CategoriaModel categoria = categoriaRepository.findById(dto.idCategoria())
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada! Id: " + dto.idCategoria()));

        MedidaModel medida = medidaRepository.findById(dto.idMedida())
                .orElseThrow(() -> new ObjectNotFoundException("Medida não encontrada! Id: " + dto.idMedida()));

        updateEntityFromDTO(produtoExistente, dto);
        ProdutoModel produtoAtualizado = produtoRepository.save(produtoExistente);
        return toResponseDTO(produtoAtualizado, categoria, medida);
    }

    @Transactional
    public void deletar(Long id) {
        ProdutoModel produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado! Id: " + id));

        produto.setAtivo(false);
        produtoRepository.save(produto);
    }

    @Transactional
    public void reativar(Long id) {
        ProdutoModel produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado! Id: " + id));

        produto.setAtivo(true);
        produtoRepository.save(produto);
    }

    private void updateEntityFromDTO(ProdutoModel entity, ProdutoDTO dto) {
        entity.setNome(dto.nome());
        entity.setDescricao(dto.descricao());
        entity.setObservacao(dto.observacao());
        entity.setValor(dto.valor());
        entity.setEstoque(dto.estoque());
        if (dto.imagem() != null && !dto.imagem().isEmpty()) {
            entity.setImagem(decodeBase64ToBytes(dto.imagem()));
        }
        entity.setIdCategoria(dto.idCategoria());
        entity.setIdMedida(dto.idMedida());
        entity.setAtivo(dto.ativo());
    }

    private ProdutoModel toEntity(ProdutoDTO dto) {
        ProdutoModel model = new ProdutoModel();
        model.setNome(dto.nome());
        model.setDescricao(dto.descricao());
        model.setObservacao(dto.observacao());
        model.setValor(dto.valor());
        model.setEstoque(dto.estoque());
        if (dto.imagem() != null && !dto.imagem().isEmpty()) {
            model.setImagem(decodeBase64ToBytes(dto.imagem()));
        }
        model.setIdCategoria(dto.idCategoria());
        model.setIdMedida(dto.idMedida());
        model.setAtivo(true);
        return model;
    }

    private ProdutoResponseDTO toResponseDTO(ProdutoModel produto, CategoriaModel categoria, MedidaModel medida) {
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getObservacao(),
                produto.getValor(),
                produto.getEstoque(),
                encodeBytesToBase64(produto.getImagem()),
                produto.getDataCadastro(),
                produto.isAtivo(),
                produto.getIdCategoria(),
                produto.getIdMedida(),
                categoria.getNome(),
                medida.getNome()
        );
    }
    /**
     * Gera os dados para o relatório de estoque.
     * @return Um DTO com a lista de itens em estoque e os totais.
     */
    @Transactional(readOnly = true)
    public RelatorioEstoqueDTO gerarRelatorioEstoque() {
        // 1. Busca todos os produtos que estão marcados como ativos.
        List<ProdutoModel> produtosAtivos = produtoRepository.findAll()
                .stream()
                .filter(ProdutoModel::isAtivo)
                .collect(Collectors.toList());

        // 2. Mapeia cada produto para o seu DTO de item de estoque.
        List<ItemEstoqueDTO> itensDeEstoque = produtosAtivos.stream().map(produto -> {
            // Regra de Negócio: Calcula o valor total do estoque para este item.
            // Valor Total = Valor Unitário * Quantidade em Estoque
            BigDecimal valorTotalItem = produto.getValor().multiply(produto.getEstoque());

            return new ItemEstoqueDTO(
                    produto.getId(),
                    produto.getNome(),
                    produto.getEstoque(),
                    produto.getValor(),
                    valorTotalItem
            );
        }).collect(Collectors.toList());

        // 3. Calcula o valor total geral do estoque somando o total de cada item.
        BigDecimal valorTotalGeral = itensDeEstoque.stream()
                .map(ItemEstoqueDTO::valorTotalEmEstoque)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Monta e retorna o DTO do relatório completo.
        return new RelatorioEstoqueDTO(
                itensDeEstoque.size(),
                valorTotalGeral,
                itensDeEstoque
        );
    }

    private String encodeBytesToBase64(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return null;
        }
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
    }

    private byte[] decodeBase64ToBytes(String base64Image) {
        if (base64Image == null || base64Image.isEmpty()) {
            return null;
        }
        String base64Data = base64Image.substring(base64Image.indexOf(",") + 1);
        return Base64.getDecoder().decode(base64Data);
    }
}