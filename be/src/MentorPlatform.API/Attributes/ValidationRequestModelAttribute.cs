
using FluentValidation;
using FluentValidation.Results;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Collections;
using System.Reflection;

namespace MentorPlatform.WebApi.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public class ValidationRequestModelAttribute : ActionFilterAttribute
{
    private readonly IServiceProvider _serviceProvider;

    public ValidationRequestModelAttribute(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var keys = context.ActionArguments.Keys.ToList();

        foreach (var key in keys)
        {
            var val = context.ActionArguments[key];
            if (val == null) continue;

            context.ActionArguments[key] = TrimRecursively(val);
        }

        foreach (var arg in context.ActionArguments)
        {
            var model = arg.Value;
            if (model == null) continue;

            var modelType = model.GetType();
            var validatorType = typeof(IValidator<>).MakeGenericType(modelType);
            var validator = _serviceProvider.GetService(validatorType) as IValidator;
            if (validator == null) continue;

            var validateAsync = validatorType
                .GetMethod(nameof(IValidator<object>.ValidateAsync), new[] { modelType, typeof(CancellationToken) });
            try
            {
                var validationTask = (Task)validateAsync.Invoke(validator, new[] { model, context.HttpContext.RequestAborted });
                await validationTask;
                var result = (ValidationResult)validationTask.GetType().GetProperty("Result")!.GetValue(validationTask)!;

                if (!result.IsValid)
                {
                    var errors = result.Errors
                        .Select(x => new Error(x.PropertyName, x.ErrorMessage))
                        .ToList();
                    var errorResponse = new Result(400, false);
                    if (errors.Count != 0)
                    {
                        errorResponse.Errors = errors;
                    }
                    context.Result = new JsonResult(errorResponse)
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                    return;
                }
            }
            catch
            {
                continue;
            }
        }
        await next();
    }
    private object TrimRecursively(object obj)
    {
        if (obj is IFormFile)
            return obj;
        if (obj is string s)
        {
            return s.Trim();
        }

        if (obj is IEnumerable enumerable &&
            obj.GetType() != typeof(string))
        {
            var listType = obj.GetType();
            if (listType.IsArray)
            {
                var elementType = listType.GetElementType()!;
                var arr = (Array)obj;
                var newArr = Array.CreateInstance(elementType, arr.Length);
                for (int i = 0; i < arr.Length; i++)
                {
                    newArr.SetValue(TrimRecursively(arr.GetValue(i)!), i);
                }
                return newArr;
            }
            else if (listType.IsGenericType)
            {
                var elementType = listType.GenericTypeArguments[0];
                var constructed = (IList)Activator.CreateInstance(
                    typeof(List<>).MakeGenericType(elementType))!;
                foreach (var e in enumerable)
                    constructed.Add(TrimRecursively(e!));
                return constructed;
            }
        }

        var t = obj.GetType();
        if (t.IsClass || (t.IsValueType && !t.IsPrimitive))
        {
            foreach (var prop in t.GetProperties(
                BindingFlags.Instance | BindingFlags.Public))
            {
                if (!prop.CanRead || !prop.CanWrite)
                    continue;

                var propVal = prop.GetValue(obj);
                if (propVal == null || prop.Name == "Password")
                    continue;

                if (prop.PropertyType == typeof(string))
                {
                    if (prop.PropertyType.Name == nameof(User.Password))
                        break;
                    var trimmed = ((string)propVal).Trim();
                    prop.SetValue(obj, trimmed);
                }
                else
                {
                    var newPropVal = TrimRecursively(propVal);
                    prop.SetValue(obj, newPropVal);
                }
            }
        }

        return obj;
    }
}