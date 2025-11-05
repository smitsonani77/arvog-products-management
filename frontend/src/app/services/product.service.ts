import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(
    page = 1,
    limit = 10,
    sort = 'price_asc',
    search = '',
    category = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('sort', sort);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get(this.baseUrl, { params });
  }

  getProduct(id: number) {
    return this.http.get(`${this.baseUrl}/id/${id}`);
  }

  createProduct(data: FormData) {
    return this.http.post(this.baseUrl, data);
  }

  updateProduct(id: number, data: FormData) {
    return this.http.put(`${this.baseUrl}/id/${id}`, data);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.baseUrl}/id/${id}`);
  }

  bulkUpload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/bulk-upload`, formData);
  }

  downloadReport(type: 'csv' | 'xlsx') {
    return this.http.get(`${this.baseUrl}/report/${type}`, {
      responseType: 'blob',
    });
  }
}
