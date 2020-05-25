import { Component, Input, Output, EventEmitter, IterableDiffers } from "@angular/core";
import { Lead } from "../../models/lead";
import { AvatarPipe } from "../../pipes/avatar/avatar";
// import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: "leads-list",
  templateUrl: "leads-list.html",
  providers: [AvatarPipe] //, SocialSharing]
})
export class LeadsListComponent {
  @Input()
  leads: Lead[];
  @Input()
  title: string;
  @Input()
  showOnlyRelevant: boolean;
  @Input()
  showLeadCount: boolean;
  @Input()
  showClientSearch: boolean;
  @Input()
  showExport: boolean;
  @Output() itemClicked = new EventEmitter<Lead>();

  public leadsCount: number;
  public filteredLeads: Lead[];
  private iterableDiffer;
  private filteredLeadsByRelevance; 

  constructor(private iterableDiffers: IterableDiffers) {//, private socialSharing: SocialSharing) {
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngDoCheck() {
    let changes = this.iterableDiffer.diff(this.leads);

    if (!changes && this.filteredLeads === this.filteredLeadsByRelevance) {
        return;
    }

    if (this.showOnlyRelevant){
      this.filteredLeads = this.leads.filter(x=> x.relevant);
      this.filteredLeadsByRelevance = true;
    }
    else{
      this.filteredLeads = this.leads;   
      this.filteredLeadsByRelevance = false;  
    }
  }
 
  public onItemClicked(item: Lead) {
    this.itemClicked.emit(item);
  }

  public export(){
    // let exports = this.filteredLeads.map(x=> this.leadExport(x));
    // let result = exports.join("\n");
    // this.socialSharing.canShareViaEmail().then(() => {
    //   // Sharing via email is possible
    //   this.socialSharing.shareViaEmail(result, 'Subject', ['recipient@example.org']).then(() => {
        
    //   }).catch((err) => {
    //     alert(err)
    //   });

    // }).catch((err) => {
    //   alert(err)
    // });
  }

  
  private leadExport(lead: Lead): string{
    var result = 
    `שם: ${lead.name} | טלפון: ${lead.phone} | תאריך יצירה: ${lead.created} | נכס: ${lead.property} | מספר חדרים: ${lead.rooms} | מקור: ${lead.source} | תקציב: ${lead.budget} | אזור: ${lead.area.join(", ")} | מטרים: ${lead.meters}`;
    return result;
  }

}
