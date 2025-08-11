import { Component } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-github-button',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './github-button.component.html',
})
export class GitHubButtonComponent {
  faGithub = faGithub;
  GITHUB_REPO_URL = environment.GITHUB_REPO_URL;
}
