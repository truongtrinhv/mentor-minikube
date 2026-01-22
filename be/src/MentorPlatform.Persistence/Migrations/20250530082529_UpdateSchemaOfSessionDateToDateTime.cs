using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentorPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchemaOfSessionDateToDateTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateAvailable",
                table: "Schedules");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "StartTime",
                table: "Schedules",
                type: "datetimeoffset",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "EndTime",
                table: "Schedules",
                type: "datetimeoffset",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<TimeOnly>(
                name: "StartTime",
                table: "Schedules",
                type: "time",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset");

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "EndTime",
                table: "Schedules",
                type: "time",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DateAvailable",
                table: "Schedules",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }
    }
}
