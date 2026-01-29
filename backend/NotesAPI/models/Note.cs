namespace NotesAPI.Models;

    public class Note
    {
        public Guid Id {get; set;}
        public string Title {get; set;} = "";
        public string Content {get; set;} = "";
        public DateTime CreatedAt {get; set;}
        public DateTime UpdatedAt {get; set;}
        public bool IsDeleted {get; set;}

    }
