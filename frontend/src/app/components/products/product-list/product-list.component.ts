import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  page = 1;
  total = 0;
  limit = 10;
  sort = 'price_asc';
  search = '';
  category = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts() {
    this.productService
      .getProducts(this.page, this.limit, this.sort, this.search, this.category)
      .subscribe((res) => {
        this.products = res.data;
        console.log('products =>', this.products);

        this.total = res.total;
      });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe((res) => (this.categories = res));
  }

  onSearch() {
    this.page = 1;
    this.loadProducts();
  }

  changeSort(value: string) {
    this.sort = value;
    this.loadProducts();
  }

  deleteProduct(id: number) {
    if (confirm('Delete this product?')) {
      this.productService
        .deleteProduct(id)
        .subscribe(() => this.loadProducts());
    }
  }
}
