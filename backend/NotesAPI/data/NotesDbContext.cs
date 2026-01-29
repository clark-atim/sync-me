using Microsoft.EntityFrameworkCore;
using NotesAPI.Models; 

namespace NotesAPI.Data
{
    public class NotesDbContext : DbContext
    {
        public NotesDbContext(DbContextOptions<NotesDbContext> options) : base(options)
        {
        }

        public DbSet<Note> Notes => Set<Note>();
    }
}