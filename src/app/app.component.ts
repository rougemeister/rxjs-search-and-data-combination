import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  combinedData: { userDetails: string; userPosts: string[] } | null = null;
  searchResults: string[] | null = null;
  isLoading = false;
  isLoadingCombined = true;
  isInputActive = false;

  cancelSearch$ = new Subject<void>();

  constructor(private apiService: ApiService) {}

  // Load combined user details and posts based on username
  loadUserData(username: string): void {
    this.apiService.findUserByUsername(username).pipe(
      switchMap(user => this.apiService.combineApiData(user.id))  // Use the userId to load combined data
    ).subscribe(data => {
      this.combinedData = data;
    });
  }

  // Handle the search input event
  onSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.cancelSearch$.next();  // Cancel previous search requests

    if (input.length >= 3) {
      this.isLoading = true;

      this.apiService.searchUsers(input).pipe(
        switchMap(results => {
          this.searchResults = results.map(user => user.username);  // Extract usernames for display
          this.isLoading = false;
          return [];
        })
      ).subscribe();
    } else {
      this.searchResults = null; // Clear results for shorter inputs
    }
  }

  onFocus(): void {
    this.isInputActive = true;
  }

  onBlur(): void {
    this.isInputActive = false;
    this.isLoading = false;
  }

}
