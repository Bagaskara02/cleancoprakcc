import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> main() async {
  final apiUserOrderUrl = 'https://be-user-cleanco-739468618342.us-central1.run.app';
  final apiWorkerServiceUrl = 'https://be-admin-cleanco-739468618342.us-central1.run.app';
  
  final endpoints = [
    '$apiWorkerServiceUrl/api/v2/services',
    '$apiWorkerServiceUrl/api/v2/service-catalog',
    '$apiUserOrderUrl/api/v1/services',
    '$apiUserOrderUrl/api/v1/service-catalog',
  ];
  
  for (final ep in endpoints) {
    print('Probing endpoint: $ep...');
    try {
      final response = await http.get(Uri.parse(ep));
      print('  Status Code: ${response.statusCode}');
      if (response.statusCode == 200) {
        print('  Response body preview: ${response.body.substring(0, response.body.length > 500 ? 500 : response.body.length)}');
        print('==================================================');
      }
    } catch (e) {
      print('  Error: $e');
    }
  }
}
