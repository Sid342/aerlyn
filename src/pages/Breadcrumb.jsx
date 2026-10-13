export default function Breadcrumb({ current }) {
  return (
    <nav className="page-crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">›</span> <span aria-current="page">{current}</span>
    </nav>
  );
}
