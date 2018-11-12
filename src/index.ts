import { Observable, fromEvent, of, throwError } from 'rxjs';
import { switchMap, map, debounceTime, catchError } from 'rxjs/operators';

const searchElem: HTMLInputElement = document.querySelector('input') as HTMLInputElement;
const result: HTMLDivElement = document.querySelector('#result') as HTMLDivElement;

const stream$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(searchElem, 'keyup');

function request$(str: string): Promise<any> {
    return fetch(`https://api.github.com/search/repositories?q=${str}&sort=stars&order=desc`)
        .then((res: Response) => res.json());
}
stream$
    .pipe(
        debounceTime(500),

        switchMap((_: any, data: any) => {
            return (searchElem.value.length > 0) ? request$(searchElem.value) : of('');
        }, (_: any, data: any) => data),

        map((data: any) => {
            if (typeof data === 'string') {
                return data = '';
            }
            else if (data.items.length == 0) {
                return console.error('Not Found');
            }
            else {
                return data.items.map((x: any) => `<li>${x.html_url}</li>`).join('');
            }
        }),

        catchError((err: any) => {
            return throwError('Not Found');
        })
    )

    .subscribe((data: any) => {
        return result.innerHTML = `<ul>${data}</ul>`
    });

