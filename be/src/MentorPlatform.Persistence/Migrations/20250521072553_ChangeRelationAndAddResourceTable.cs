using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentorPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangeRelationAndAddResourceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "CourseResources");

            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "CourseResources");

            migrationBuilder.DropColumn(
                name: "FileType",
                table: "CourseResources");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "CourseResources");

            migrationBuilder.AddColumn<Guid>(
                name: "ResourceId",
                table: "CourseResources",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Resources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MentorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resources_Users_MentorId",
                        column: x => x.MentorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseResources_ResourceId",
                table: "CourseResources",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_Resources_MentorId",
                table: "Resources",
                column: "MentorId");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseResources_Resources_ResourceId",
                table: "CourseResources",
                column: "ResourceId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseResources_Resources_ResourceId",
                table: "CourseResources");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropIndex(
                name: "IX_CourseResources_ResourceId",
                table: "CourseResources");

            migrationBuilder.DropColumn(
                name: "ResourceId",
                table: "CourseResources");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "CourseResources",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "CourseResources",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FileType",
                table: "CourseResources",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "CourseResources",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
