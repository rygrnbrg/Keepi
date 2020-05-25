export class Comment {
  title: string;
  text: string;
  date: Date;
  commentType: CommentType;

  constructor(text: string, date?: Date, title?: string, commentType?: CommentType) {
    this.text = text;
    this.date = date ? date : new Date(Date.now());
    this.title = title? title : "";
    this.commentType = commentType? commentType : CommentType.UserComment;
  }
}


export enum CommentType{
    UserComment,
    MessageSent
}

