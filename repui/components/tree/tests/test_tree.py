from pathlib import Path

from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase

from repui.components.tree.manifest import COMPONENT


class TreeTests(SimpleTestCase):
    def test_render(self):
        html = Template('{% load repui %}{% tree %}{% tree_item label="Root" expanded=True %}{% tree_item label="Leaf" %}{% endtree_item %}{% endtree_item %}{% endtree %}').render(Context())
        self.assertIn('data-rui-tree', html)

    def test_required_arguments(self):
        with self.assertRaises(TemplateSyntaxError):
            Template('{% load repui %}{% tree %}{% tree_item %}Bad{% endtree_item %}{% endtree %}')

    def test_assets_and_runtime_contract(self):
        root = Path(__file__).resolve().parents[3]
        for asset in (*COMPONENT["styles"], *COMPONENT["scripts"]):
            self.assertTrue((root / "static" / asset).is_file(), asset)
        self.assertEqual(COMPONENT["runtime"]["mount"], "mountTrees")
        source = (root / "static/repui/components/tree/tree.js").read_text(encoding="utf-8")
        self.assertIn("export function mountTrees", source)
        self.assertIn("refresh()", source)
        self.assertIn("destroy()", source)
        bootstrap = (root / "static/repui/runtime/bootstrap.js").read_text(encoding="utf-8")
        self.assertIn('["tree", mountTrees]', bootstrap)
