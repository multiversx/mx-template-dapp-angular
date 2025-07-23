import { Component } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { GITHUB_REPO_URL } from '../../../config';

@Component({
  selector: 'app-github-button',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './github-button.component.html',
})
export class GitHubButtonComponent {
  faGithub = faGithub;
  GITHUB_REPO_URL = GITHUB_REPO_URL;
}
