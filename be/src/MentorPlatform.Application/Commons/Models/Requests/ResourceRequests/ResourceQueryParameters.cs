using MentorPlatform.Application.Commons.Models.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MentorPlatform.Application.Commons.Models.Requests.ResourceRequests;
public class ResourceQueryParameters : QueryParameters
{
    public string? FileType { get; set; }
}
