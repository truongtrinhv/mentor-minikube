using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MentorPlatform.Application.Commons.Models.Requests.CourseRequests;
public class CourseQueryParameters : QueryParameters
{
    public Guid? CategoryId { get; set; }
    public CourseLevel? Level { get; set; }
    public Guid? MentorId { get; set; }
}
