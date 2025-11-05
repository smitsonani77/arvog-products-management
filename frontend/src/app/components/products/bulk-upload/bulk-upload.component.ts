import { Component } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
})
export class BulkUploadComponent {
  file: File | null = null;
  result: any;
  progress = 0;

  constructor(private productService: ProductService) {}

  onFileSelect(e: any) {
    this.file = e.target.files[0];
  }

  upload() {
    if (!this.file) return;

    this.productService.bulkUpload(this.file).subscribe({
      next: (res) => (this.result = res),
      error: (err) => alert(err.error.error || 'Upload failed'),
    });
  }
}
