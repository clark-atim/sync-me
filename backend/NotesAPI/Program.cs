using System.Data.Common;
using System.Runtime.InteropServices;
using Microsoft.EntityFrameworkCore;
using NotesAPI.Data;
using NotesAPI.Models;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<NotesDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

var app = builder.Build();

//Get All Notes
app.MapGet("/notes", async (NotesDbContext db) =>
{
    var notes = await db.Notes
        .Where(n => !n.IsDeleted)
        .OrderByDescending(n => n.UpdatedAt)
        .ToListAsync();

    return Results.Ok(notes);
});


//Get Note by ID
app.MapGet("/notes/{id:int}", async (int id, NotesDbContext db) =>
{
    var note = await db.Notes.FindAsync(id);
    return note == null || note.IsDeleted 
        ? Results.NotFound() 
        : Results.Ok(note);
});

//Create Note
app.MapPost("/notes", async (Note newNote, NotesDbContext db) =>
{
    newNote.CreatedAt = DateTime.UtcNow;
    newNote.UpdatedAt = DateTime.UtcNow;
    newNote.IsDeleted = false;

    db.Notes.Add(newNote);
    await db.SaveChangesAsync();

    return Results.Created($"/notes/{newNote.Id}", newNote);
});

//Note Update
app.MapPut("/notes/{id}", async (int id, Note updatedNote, NotesDbContext db) =>
{
    var note = await db.Notes.FindAsync(id);
    if (note == null || note.IsDeleted) return Results.NotFound();

    note.Title = updatedNote.Title;
    note.Content = updatedNote.Content;
    note.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(note);
});

//Delete a NOte
app.MapDelete("/notes/{id}", async (int id, NotesDbContext db) =>
{
    var note = await db.Notes.FindAsync(id);
    if (note == null || note.IsDeleted) return Results.NotFound();

    note.IsDeleted = true;
    note.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
