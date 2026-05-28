using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/products")]
[SwaggerTag("Product catalog CRUD and search endpoints.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class ProductsController(IProductService productService) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Search and list products",
        Description = "Returns a paged product list. Supports filtering by keyword, category, brand, style, price, stock, sale state, rating, sort order and paging.")]
    [ProducesResponseType(typeof(ProductListResult), StatusCodes.Status200OK)]
    public ActionResult<ProductListResult> GetAll(
        [FromQuery] string? q,
        [FromQuery] string? category,
        [FromQuery] string? brand,
        [FromQuery] string? style,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? inStock,
        [FromQuery] bool? onSale,
        [FromQuery] int? ratingGte,
        [FromQuery] string? sort,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] bool includeInactive = false)
    {
        var result = productService.Search(new ProductQuery(
            q,
            category,
            brand,
            style,
            minPrice,
            maxPrice,
            inStock ?? false,
            onSale ?? false,
            ratingGte,
            sort,
            page ?? 1,
            pageSize ?? 20,
            includeInactive));

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Get a product by id",
        Description = "Returns a single product by numeric identifier.")]
    [ProducesResponseType(typeof(ProductView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<ProductView> GetById(int id)
    {
        return Ok(RequireResource(productService.GetById(id), $"Product with id {id} was not found."));
    }

    [HttpPost]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Create a product",
        Description = "Creates a new product in the catalog. Returns 409 when SKU or slug is already in use, or when the selected category is inactive.")]
    [ProducesResponseType(typeof(ProductView), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<ProductView> Create([FromBody] ProductUpsertInput input)
    {
        var created = productService.Create(input);
        return Created($"/api/products/{created.ProductId}", created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Update a product",
        Description = "Updates an existing product by numeric identifier. Returns 409 when SKU or slug is already in use, or when the selected category is inactive.")]
    [ProducesResponseType(typeof(ProductView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<ProductView> Update(int id, [FromBody] ProductUpsertInput input)
    {
        var updated = productService.Update(id, input);
        return Ok(RequireResource(updated, $"Product with id {id} was not found."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Delete a product",
        Description = "Deletes a product from the catalog by numeric identifier.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        EnsureResourceExists(productService.Delete(id), $"Product with id {id} was not found.");
        return NoContent();
    }

    [HttpGet("{id:int}/reviews")]
    [SwaggerOperation(Summary = "Get product reviews")]
    public ActionResult<IReadOnlyCollection<ProductReviewView>> GetReviews(int id)
    {
        return Ok(productService.GetReviews(id));
    }

    [HttpPost("{id:int}/reviews")]
    [SwaggerOperation(Summary = "Add a product review")]
    public ActionResult<ProductReviewView> AddReview(int id, [FromBody] ProductReviewCreateInput input)
    {
        if (id != input.ProductId) return BadRequest("Mismatched product id.");
        return Ok(productService.AddReview(input));
    }
}
