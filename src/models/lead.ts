import { LeadTypeID } from './lead-property-metadata';
import { Comment } from './comment';

export class Contact {
  name: string;
  phone: string;

  constructor(phone: string, name: string) {
    this.phone = phone;
    this.name = name;
  }
}

export class Lead extends Contact {
  constructor(phone: string, name: string, type?: LeadTypeID) {
    super(phone, name);
    this.created = new Date();
    this.type = type;
  }

  avatar: string;
  name: string;
  phone: string;
  created: Date;
  type: LeadTypeID;
  property: string;
  rooms: string;
  source: string;
  budget: number;
  area: string[];
  relevant: boolean;
  meters: string;
  comments: Comment[];
  ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;
}