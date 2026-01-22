using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentorPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExpertiseAgainV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserExpertises_Expertise_ExpertiseId",
                table: "UserExpertises");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Expertise",
                table: "Expertise");

            migrationBuilder.RenameTable(
                name: "Expertise",
                newName: "Expertises");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Expertises",
                table: "Expertises",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserExpertises_Expertises_ExpertiseId",
                table: "UserExpertises",
                column: "ExpertiseId",
                principalTable: "Expertises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserExpertises_Expertises_ExpertiseId",
                table: "UserExpertises");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Expertises",
                table: "Expertises");

            migrationBuilder.RenameTable(
                name: "Expertises",
                newName: "Expertise");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Expertise",
                table: "Expertise",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserExpertises_Expertise_ExpertiseId",
                table: "UserExpertises",
                column: "ExpertiseId",
                principalTable: "Expertise",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
