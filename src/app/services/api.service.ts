import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private userApiUrl = 'https://jsonplaceholder.typicode.com/users';
  private postsApiUrl = 'https://jsonplaceholder.typicode.com/posts'; // Example posts API

  constructor(private http: HttpClient) {}

  // Search usernames based on the search term
  searchUsers(term: string): Observable<any[]> {
    return this.http.get<any[]>(this.userApiUrl).pipe(
      map(users => {
        // Filter users by username matching the search term
        return users.filter(user => user.username.toLowerCase().includes(term.toLowerCase()));
      }),
      catchError(() => {
        return of([{ username: 'Error: Unable to fetch user data' }]);
      }),
      delay(500)  // Simulate API delay
    );
  }

  // Find user by username and return the corresponding user object
  findUserByUsername(username: string): Observable<any> {
    return this.http.get<any[]>(this.userApiUrl).pipe(
      map(users => users.find(user => user.username === username)),
      catchError(() => {
        return of(null);  // Return null if the user is not found or if there's an error
      })
    );
  }

  // Combine user details and posts
  combineApiData(userId: number): Observable<{ userDetails: string; userPosts: string[] }> {
    const userDetails$ = this.http.get<any>(`${this.userApiUrl}/${userId}`).pipe(
      map(user => `User Details: ${user.name}`),
      catchError(() => of('Error fetching user details'))
    );

    const userPosts$ = this.http.get<any[]>(`${this.postsApiUrl}?userId=${userId}`).pipe(
      map(posts => posts.map(post => post.title)),
      catchError(() => of(['Error fetching user posts']))
    );

    return combineLatest([userDetails$, userPosts$]).pipe(
      map(([userDetails, userPosts]) => ({ userDetails, userPosts })),
      catchError(() => of({ userDetails: 'Error fetching user details', userPosts: ['Error fetching user posts'] }))
    );
  }
}
