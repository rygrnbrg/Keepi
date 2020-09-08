import { Component, OnInit } from '@angular/core';
import { Lead } from 'src/models/lead';
import { Comment } from 'src/models/comment';
import { NavParams, ModalController } from '@ionic/angular';
import { LeadsProvider } from 'src/providers/leads/leads';
import { LeadPropertyMetadataProvider } from 'src/providers/lead-property-metadata/lead-property-metadata';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss']
})
export class CommentPage implements OnInit {
  public text: string = "";
  public lead: Lead;

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    public leadsProvider: LeadsProvider) {
    this.lead = this.navParams.get("lead");
  }

  ngOnInit() {
  }

  public submit() {
    if (this.text.length) {
      let comment = new Comment(this.text);
      this.leadsProvider.addComment(this.lead, comment).then(() => {
        this.modalCtrl.dismiss({ "success": true });
      });
    }
  }

  public closePage() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
}
