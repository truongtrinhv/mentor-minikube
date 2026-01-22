using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentorPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddConfigOneToManyForSessionAndSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MentoringSessions_ScheduleId",
                table: "MentoringSessions");

            migrationBuilder.CreateIndex(
                name: "IX_MentoringSessions_OldScheduleId",
                table: "MentoringSessions",
                column: "OldScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_MentoringSessions_ScheduleId",
                table: "MentoringSessions",
                column: "ScheduleId",
                unique: true,
                filter: "[RequestStatus] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_MentoringSessions_Schedules_OldScheduleId",
                table: "MentoringSessions",
                column: "OldScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MentoringSessions_Schedules_OldScheduleId",
                table: "MentoringSessions");

            migrationBuilder.DropIndex(
                name: "IX_MentoringSessions_OldScheduleId",
                table: "MentoringSessions");

            migrationBuilder.DropIndex(
                name: "IX_MentoringSessions_ScheduleId",
                table: "MentoringSessions");

            migrationBuilder.CreateIndex(
                name: "IX_MentoringSessions_ScheduleId",
                table: "MentoringSessions",
                column: "ScheduleId",
                unique: true);
        }
    }
}
