using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/categories")]
[SwaggerTag("Category CRUD endpoints.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class CategoriesController(ICategoryService categoryService) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "List categories",
        Description = "Returns all product categories.")]
    [ProducesResponseType(typeof(CategoryView[]), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyCollection<CategoryView>> GetAll()
    {
        return Ok(categoryService.GetAll());
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Get a category by id",
        Description = "Returns a single category by numeric identifier.")]
    [ProducesResponseType(typeof(CategoryView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<CategoryView> GetById(int id)
    {
        return Ok(RequireResource(categoryService.GetById(id), $"Category with id {id} was not found.", AppErrorCodes.CategoryNotFound));
    }

    [HttpPost]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Create a category",
        Description = "Creates a new category. Returns 409 when the category name or slug is already in use.")]
    [ProducesResponseType(typeof(CategoryView), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<CategoryView> Create([FromBody] CategoryUpsertInput input)
    {
        var created = categoryService.Create(input);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Update a category",
        Description = "Updates an existing category. Returns 404 when the category does not exist and 409 when the category name or slug is already in use, or when deactivation would leave active products assigned to that category.")]
    [ProducesResponseType(typeof(CategoryView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<CategoryView> Update(int id, [FromBody] CategoryUpsertInput input)
    {
        var updated = categoryService.Update(id, input);
        return Ok(RequireResource(updated, $"Category with id {id} was not found.", AppErrorCodes.CategoryNotFound));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Delete a category",
        Description = "Deletes a category. Returns 409 when the category is still referenced by products.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public IActionResult Delete(int id)
    {
        switch (categoryService.Delete(id))
        {
            case CategoryDeleteResult.Deleted:
                return NoContent();
            case CategoryDeleteResult.HasProducts:
                throw new ConflictException("Category is referenced by one or more products and cannot be deleted.", AppErrorCodes.CategoryHasProducts);
            default:
                throw new NotFoundException($"Category with id {id} was not found.", AppErrorCodes.CategoryNotFound);
        }
    }
}
