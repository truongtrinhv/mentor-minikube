using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentorPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAndChangeNameOFieldsInSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "MentoringSessions");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "MentoringSessions",
                newName: "Notes");

            migrationBuilder.AddColumn<int>(
                name: "SessionType",
                table: "MentoringSessions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SessionType",
                table: "MentoringSessions");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "MentoringSessions",
                newName: "Title");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "MentoringSessions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
