using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentorPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMentorOfCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequests_Users_UserId",
                table: "ApplicationRequests");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "ApplicationRequests");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "ApplicationRequests",
                newName: "MentorId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequests_UserId",
                table: "ApplicationRequests",
                newName: "IX_ApplicationRequests_MentorId");

            migrationBuilder.AddColumn<Guid>(
                name: "MentorId",
                table: "Courses",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "Note",
                table: "ApplicationRequests",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ApplicationRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Courses_MentorId",
                table: "Courses",
                column: "MentorId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequests_Users_MentorId",
                table: "ApplicationRequests",
                column: "MentorId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Users_MentorId",
                table: "Courses",
                column: "MentorId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequests_Users_MentorId",
                table: "ApplicationRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Users_MentorId",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_MentorId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "MentorId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ApplicationRequests");

            migrationBuilder.RenameColumn(
                name: "MentorId",
                table: "ApplicationRequests",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequests_MentorId",
                table: "ApplicationRequests",
                newName: "IX_ApplicationRequests_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Note",
                table: "ApplicationRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "ApplicationRequests",
                type: "bit",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequests_Users_UserId",
                table: "ApplicationRequests",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
