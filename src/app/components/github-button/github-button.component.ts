import { Component } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { GITHUB_REPO_URL } from '../../../constants';

import { faGithub } from '@fortawesome/free-brands-svg-icons';

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
