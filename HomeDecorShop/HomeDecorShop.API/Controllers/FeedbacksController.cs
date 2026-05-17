using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/feedbacks")]
[SwaggerTag("Feedback CRUD endpoints.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class FeedbacksController(IFeedbackService feedbackService) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "List feedback entries",
        Description = "Returns all feedback entries ordered by newest first.")]
    [ProducesResponseType(typeof(FeedbackView[]), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyCollection<FeedbackView>> GetAll()
    {
        return Ok(feedbackService.GetAll());
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Get feedback by id",
        Description = "Returns a single feedback entry by numeric identifier.")]
    [ProducesResponseType(typeof(FeedbackView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<FeedbackView> GetById(int id)
    {
        return Ok(RequireResource(feedbackService.GetById(id), $"Feedback with id {id} was not found."));
    }

    [HttpPost]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Create feedback",
        Description = "Creates a new feedback entry.")]
    [ProducesResponseType(typeof(FeedbackView), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public ActionResult<FeedbackView> Create([FromBody] FeedbackUpsertInput input)
    {
        var created = feedbackService.Create(input);
        return CreatedAtAction(nameof(GetById), new { id = created.FeedbackId }, created);
    }

    [HttpPost("{id:int}/reply")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Reply to feedback",
        Description = "Adds an admin reply to a specific feedback entry.")]
    [ProducesResponseType(typeof(FeedbackView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<FeedbackView> Reply(int id, [FromBody] FeedbackReplyInput input)
    {
        var updated = feedbackService.Reply(id, input.ReplyContent);
        return Ok(RequireResource(updated, $"Feedback with id {id} was not found."));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Update feedback",
        Description = "Updates an existing feedback entry by numeric identifier.")]
    [ProducesResponseType(typeof(FeedbackView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<FeedbackView> Update(int id, [FromBody] FeedbackUpsertInput input)
    {
        var updated = feedbackService.Update(id, input);
        return Ok(RequireResource(updated, $"Feedback with id {id} was not found."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(
        Summary = "Delete feedback",
        Description = "Deletes a feedback entry by numeric identifier.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        EnsureResourceExists(feedbackService.Delete(id), $"Feedback with id {id} was not found.");
        return NoContent();
    }
}
