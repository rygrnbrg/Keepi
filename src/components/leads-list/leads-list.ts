import { Component, Input, Output, EventEmitter, IterableDiffers } from "@angular/core";
import { Lead } from "../../models/lead";
import { AvatarPipe } from "../../pipes/avatar/avatar";
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: "leads-list",
  templateUrl: "leads-list.html",
  providers: [AvatarPipe, SocialSharing]
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

  constructor(
    private iterableDiffers: IterableDiffers,
    private socialSharing: SocialSharing,
    private platform: Platform) {
    this.iterableDiffer = this.iterableDiffers.find([]).create(null);
  }

  ngDoCheck() {
    let changes = this.iterableDiffer.diff(this.leads);

    if (!changes && this.filteredLeads === this.filteredLeadsByRelevance) {
      return;
    }

    if (this.showOnlyRelevant) {
      this.filteredLeads = this.leads.filter(x => x.relevant);
      this.filteredLeadsByRelevance = true;
    }
    else {
      this.filteredLeads = this.leads;
      this.filteredLeadsByRelevance = false;
    }
  }

  public onItemClicked(item: Lead) {
    this.itemClicked.emit(item);
  }

  public export() {
    let exports = this.filteredLeads.map(x => this.leadExport(x));
    let result = exports.map((value, i) => (i + 1).toString().concat(`. ${value}`)).join("\n\n");
    if (this.platform.is("cordova")) {
      this.socialSharing.canShareViaEmail().then(() => {
        // Sharing via email is possible
        this.socialSharing.share(result, 'Keepi - ייצוא רשימת לידים', []).then(() => {
        }).catch((err) => {
          console.error(err);
        });

      }).catch((err) => {
        console.error(err);
      });
    }
    else {
      alert(result);
    }
  }


  private leadExport(lead: Lead): string {
    var result = `שם: ${lead.name} ,טלפון: ${lead.phone} , נוצר בתאריך: ${lead.created.toLocaleDateString()} \n`;
    result += lead.property ? `נכס: ${lead.property}, ` : "";
    result += lead.rooms ? `מספר חדרים: ${lead.rooms}, ` : "";
    result += lead.budget ? `תקציב: ${lead.budget}, ` : "";
    result += lead.meters ? `מטרים: ${lead.meters}, ` : "";
    result = result.substr(0, result.length - 2);
    result += "\n";

    result += lead.area ? `אזור: ${lead.area.join("/ ")}` : "";
    result += "\n";

    result += lead.source ? `מקור: ${lead.source}, ` : "";


    result = result.substr(0, result.length - 2);
    return result;
  }

}
