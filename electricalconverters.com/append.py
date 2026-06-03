css_append = """
/* Fix page-wrap padding when preceded by calc-header */
.calc-header + #main-content .page-wrap {
  padding-top: 2rem;
}
@media (max-width: 640px) {
  .calc-header + #main-content .page-wrap {
    padding-top: 1.5rem;
  }
}
"""

with open(r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com\assets\css\main.css", "a", encoding="utf-8") as f:
    f.write(css_append)
