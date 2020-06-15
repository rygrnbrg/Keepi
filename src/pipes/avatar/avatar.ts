import { Lead } from './../../models/lead';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
/**
 * Generated class for the AvatarPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'avatar',
  pure: false
})
export class AvatarPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) {

  }

  transform(value: string, item?: Lead): any {
    if (!item || item.relevant){
      return 'assets/img/profile_avatar.png';      
    }

    return 'assets/img/profile_avatar_danger.png';      

  }
}
